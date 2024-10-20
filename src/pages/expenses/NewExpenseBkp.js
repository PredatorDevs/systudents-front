import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Input } from 'antd';

const NewExpense = () => {
  // Esquema de validación usando Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .max(15, 'Debe tener 15 caracteres o menos')
      .required('Su nombre debe llevar cinco caracteres o menos'),
    email: Yup.string()
      .email('Dirección de correo inválida')
      .required('Campo requerido'),
    password: Yup.string()
      .min(6, 'Debe tener al menos 6 caracteres')
      .required('Campo requerido'),
  });

  // field: { name, value, onChange, onBlur }
  // form: also values, setXXXX, handleXXXX, dirty, isValid, status, etc.

  return (
    <Formik
      initialValues={{ name: '', email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        // Simulación de envío de datos
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(false);
        }, 400);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <div>
            <label htmlFor="name">Nombre</label>
            <Field name="name">
              {
                ({ field, form: { touched, errors }, meta }) => (
                  <div>
                    <Input type="text" name="name" {...field} />
                    {meta.touched && meta.error && (<div className="error">{meta.error}</div>)}
                  </div>
                )
              }
            </Field>
          </div>

          <div>
            <label htmlFor="email">Correo Electrónico</label>
            <Field type="email" name="email" />
            <ErrorMessage name="email" component="div" />
          </div>

          <div>
            <label htmlFor="password">Contraseña</label>
            <Field type="password" name="password" />
            <ErrorMessage name="password" component="div" />
          </div>

          <button type="submit" disabled={isSubmitting}>
            Enviar
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default NewExpense;
