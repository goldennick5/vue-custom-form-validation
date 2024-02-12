import { ref, computed } from "vue";
import * as zod from "zod";

export function useValidation<T>(validationSchema: zod.ZodSchema<T>, initialData: T | T[]) {
  const data = ref(initialData) as { value: T | T[] };
  const errors = ref<zod.ZodIssue[]>([]);
  const isValid = computed(() => errors.value.length === 0);


  const validate = () => {
    const result = validationSchema.safeParse(data.value);
    errors.value = result.success ? [] : result.error.issues;
  };

  const clearErrors = () => {
    errors.value = [];
  };

  const getError = (path: string) => {
    return errors.value.find(issue => issue.path.join(".") === path);
  };

  return {
    data,
    errors,
    isValid,
    validate,
    clearErrors,
    getError,
  };
}