<script lang="ts" setup>
import {reactive} from "vue"
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
  iin: z
    .string()
    .nonempty("IIN is required")
    .length(14, "IIN must be exactly 12 digits")
})

const arraySchema = z.array(objectSchema)

const {data, errors, isValid, validate, clearErrors, getError} = useValidation(arraySchema, dataTest)

const submitForm = () => {
  validate()
  if (isValid) {
    function normalizeData(data: IDataTest[]) {
      return data.map((item: IDataTest) => ({
        phone: phoneNumberFormatter(item.phone),
        iin: item.iin
      }))
    }

    console.log(normalizeData(data.value as IDataTest[]))
  }
}

const hasError = (field: string, index: number) => {
  return getError(`${index}.${field}`) !== undefined
}
</script>

<template>
  <div class="flex justify-center items-center text-white h-[400px]">
    <template v-for="(form, index) in data" :key="index">
      <FFForm>
        <FFFieldset title="Телефон" :required="hasError('phone', index)">
          <FFInput v-maska data-maska="+7 (###) ### ## ##" id="phone" name="phone" v-model="form.phone" type="tel" />
        </FFFieldset>
        {{ getError(`${index}.phone`)?.message }}

        <FFFieldset title="ИИН" :required="hasError('iin', index)">
          <FFInput v-maska data-maska="#### #### ####" id="iin" name="iin" v-model="form.iin" type="text" />
        </FFFieldset>
        {{ getError(`${index}.iin`)?.message }}

        <FFButton @click="submitForm" title="Нажми броо" />
      </FFForm>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
