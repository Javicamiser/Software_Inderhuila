import { useForm, UseFormProps, FieldValues, SubmitHandler } from 'react-hook-form';

// ============================================================================
// HOOK: useFormularioWithValidation
// ============================================================================

/**
 * Hook que combina react-hook-form con validaciones personalizadas
 * 
 * Uso mejorado:
 * const form = useFormularioWithValidation<DeportistaForm>(
 *   {
 *     defaultValues: {
 *       tipo_documento_id: '',
 *       numero_documento: '',
 *       ...
 *     },
 *     mode: 'onChange',
 *   },
 *   {
 *     numero_documento: {
 *       validate: (value) => /^\d{6,20}$/.test(value) || 'Documento inválido',
 *     },
 *   }
 * );
 */
export function useFormularioWithValidation<T extends FieldValues>(
  options?: UseFormProps<T>,
  customValidations?: Record<string, any>
) {
  const form = useForm<T>(options);

  return {
    ...form,
    customValidations,
    onSubmit: (callback: SubmitHandler<T>) =>
      form.handleSubmit(async (data) => {
        // Validaciones personalizadas
        const errors: Record<string, string> = {};

        if (customValidations) {
          for (const [field, rules] of Object.entries(customValidations)) {
            if (rules.validate) {
              const error = await rules.validate((data as any)[field]);
              if (error !== true) {
                errors[field] = error;
              }
            }
          }
        }

        if (Object.keys(errors).length > 0) {
          Object.entries(errors).forEach(([field, message]) => {
            form.setError(field as any, { message });
          });
          return;
        }

        // Si todas las validaciones pasaron, ejecutar callback
        await callback(data);
      }),
  };
}

export default useFormularioWithValidation;