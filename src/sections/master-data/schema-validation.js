import * as Yup from "yup";

export const projectSchema = Yup.object().shape({
  name: Yup.string().required("Project Name is required"),
});

export const clusterSchema = Yup.object().shape({
  name: Yup.string().required("Cluster Name is required"),
});

export const activityMethodSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  code: Yup.string().required("Code is required"),
});

export const equipmentModelSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  activity_method: Yup.string().required("Activity Method is required"),
  cluster: Yup.string().required("Cluster is required"),
});

export const eventSchema = Yup.object().shape({
  name: Yup.string().required("Event activity is required"),
  status: Yup.string().required("Event is required"),
});

export const uomSchema = Yup.object().shape({
  name: Yup.string().required("Uom is required"),
});

export const materialRecivedSchema = Yup.object().shape({
  name: Yup.string().required("Mat Recived is required"),
});

export const materialCountSchema = Yup.object().shape({
  name: Yup.string().required("Material Count is required"),
});

export const activitySchema = Yup.object().shape({
  name: Yup.string().required("Activity is required"),
  process_method: Yup.string().required("Process Method is required"),
});

export const processLoadingSchema = Yup.object().shape({
  name: Yup.string().required("Process Loading is required"),
});

export const processMaterialSchema = Yup.object().shape({
  name: Yup.string().required("Process Material is required"),
});