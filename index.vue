<script lang="ts" setup>
import {reactive, computed} from "vue"
import FFForm from "@/components/FFUI/FFForm.vue"
import FFFieldset from "@/components/FFUI/FFFieldset.vue"
import FFInput from "@/components/FFUI/FFInput.vue"
import FFButton from "@/components/FFUI/FFButton.vue"
import {vMaska} from "maska"
import {z} from "zod"
import {useValidation} from "@/composables/useValidation"
import {useFormatters} from "@/composables/useFormatters"

interface IDataTest {
  phone: string
  iin: string
}

const {phoneNumberFormatter} = useFormatters()

const dataTest = reactive<IDataTest[]>([
  {
    phone: "",
    iin: ""
  },
  {
    phone: "",
    iin: ""
  },
  {
    phone: "",
    iin: ""
  }
])

const objectSchema = z.object({
  phone: z
    .string()
    .nonempty("Phone is required")
    .regex(/^\+7 \(\d{3}\) \d{3} \d{2} \d{2}$/, "Invalid phone number format")
    .min(16, "Phone number is too short"),
  iin: z.string().nonempty("IIN is required").length(14, "IIN must be exactly 12 digits")
})

const arraySchema = z.array(objectSchema)

const {data, isValid, errors, isPassedValidation, submitIsClicked, validate, debouncedValidateField} = useValidation(
  arraySchema,
  objectSchema,
  dataTest
)

const submitForm = () => {
  validate()
  const validationResult = arraySchema.safeParse(dataTest)
  if (validationResult.success) {
    function normalizeData(data: IDataTest[]) {
      return data.map((item: IDataTest) => ({
        phone: phoneNumberFormatter(item.phone),
        iin: item.iin
      }))
    }
    console.log(normalizeData(dataTest))
  } else {
    console.log("Did not pass validation")
  }
}
</script>

<template>
  <div class="flex justify-center items-center text-white h-[400px]">
    <template v-for="(form, index) in data" :key="index">
      <FFForm>
        <div class="flex flex-col">
          <FFFieldset
            title="Телефон"
            :required="submitIsClicked && !form.phone"
            :isError="!!form.phone && !isPassedValidation[index]?.phone">
            <FFInput
              v-maska
              data-maska="+7 (###) ### ## ##"
              id="phone"
              name="phone"
              v-model="form.phone"
              type="tel"
              @input="debouncedValidateField(index, 'phone')" />
          </FFFieldset>
          <span v-show="errors[index]?.phone?.message" class="mt-1 text-red-400">
            {{ errors[index]?.phone?.message }}
          </span>
        </div>

        <div class="flex flex-col">
          <FFFieldset
            title="ИИН"
            :required="submitIsClicked && !form.iin"
            :isError="!!form.iin && !isPassedValidation[index]?.iin">
            <FFInput
              v-maska
              data-maska="#### #### ####"
              id="iin"
              name="iin"
              v-model="form.iin"
              type="text"
              @input="debouncedValidateField(index, 'iin')" />
          </FFFieldset>
          <span v-show="errors[index]?.iin?.message" class="mt-1 text-red-400">
            {{ errors[index]?.iin?.message }}
          </span>
        </div>

        <FFButton @click="submitForm" title="pick me puta madra" />
      </FFForm>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
