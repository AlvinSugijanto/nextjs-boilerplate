import * as Yup from "yup";

export const vehicleSchema = Yup.object().shape({
  name: Yup.string().required("Vehicle Name is required"),
  unit_model: Yup.string().required("Unit Model is required"),
  model: Yup.string().required("Model is required"),
  type: Yup.string().required("Type is required"),
});

export const operatorSchema = Yup.object().shape({
  name: Yup.string().required("Operator Name is required"),
});
