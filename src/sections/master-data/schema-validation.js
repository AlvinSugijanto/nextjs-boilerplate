import * as Yup from "yup";

export const vehicleSchema = Yup.object().shape({
  name: Yup.string().required("Vehicle Name is required"),
  unit_model: Yup.string().required("Unit Model is required"),
  type: Yup.string().required("Type is required"),
  device_id: Yup.string().required("Device is required"),
});

export const operatorSchema = Yup.object().shape({
  name: Yup.string().required("Operator Name is required"),
});

export const routeSchema = Yup.object().shape({
  name: Yup.string().required("Route Name is required"),
  Source: Yup.string().required("Source is required"),
  Destination: Yup.string()
    .required("Destination is required")
    .notOneOf([Yup.ref("Source")], "Destination cannot be the same as Source"),
});

export const projectSchema = Yup.object().shape({
  name: Yup.string().required("Project Name is required"),
});
