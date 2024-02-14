import {ref, computed} from "vue"
import {z} from "zod"
import {useI18n} from "vue-i18n"
import { useDebounce } from "@/composables/useDebounce"

export function useValidation<T>(
  validationArraySchema?: z.ZodArray<any>,
  validationObjectSchema?: z.ZodObject<any>,
  initialData?: T | T[]
) {
  const data = ref(initialData) as {value: T | T[]}
  const errors = ref<z.ZodIssue[]>([])
  const submitIsClicked = ref<boolean>(false)
  const isValid = computed(() => errors.value.length === 0)

  let isPassedValidation = ref<{[key: string]: boolean}[]>([])
  const {t} = useI18n()

  const validateField = (index: number, field: string) => {
    const dataItem = data.value[index][field]
    const fieldSchema = validationObjectSchema.shape[field]
    const result = fieldSchema.safeParse(dataItem)

    if (!errors.value[index]) {
      errors.value[index] = {}
    }

    errors.value[index][field] = result.success
      ? undefined
      : {
          ...(result.error && result.error.issues && result.error.issues[0]),
          message: t(`app.form.validation.${result.error.issues[0].message}`)
        }

    if (!isPassedValidation.value[index]) {
      isPassedValidation.value[index] = {}
    }

    if (isPassedValidation.value[index][field] === undefined) {
      isPassedValidation.value[index][field] = false
    }

    isPassedValidation.value[index][field] = result.success
  }

  const debouncedValidateField = useDebounce(validateField, 100)

  const validate = () => {
    submitIsClicked.value = true
    errors.value = []

    if (Array.isArray(data.value)) {
      data.value.forEach((dataItem, index) => {
        const result = validationArraySchema?.safeParse(dataItem)

        if (!result.success) {
          errors.value.push(...result.error.issues)
        }

        Object.keys(dataItem).forEach((field) => {
          validateField(index, field)
        })
      })
    } else {
      const result = validationObjectSchema?.safeParse(data.value)

      if (!result.success) {
        errors.value.push(...result.error.issues)
      }

      Object.keys(data.value).forEach((field) => {
        validateField(0, field)
      })
    }
  }

  const clearErrors = () => {
    errors.value = []
  }

  return {
    data,
    errors,
    isPassedValidation,
    submitIsClicked,
    isValid,
    validate,
    clearErrors,
    debouncedValidateField,
  }
}
