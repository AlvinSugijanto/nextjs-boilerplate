"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { RHFTextField } from "@/components/hook-form";
import Iconify from "@/components/iconify"; // ✅ gunakan komponen Iconify
import { useBoolean } from "@/hooks/useBoolean";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

// ----------------------------------------------------------------------

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email must be filled"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password must be filled"),
});

const dummyLogin = {
  email: "example@gmail.com",
  password: "2wsx1qaz",
};

export function LoginForm({ className, ...props }) {
  const { login, loginSSO } = useAuth();

  const showPassword = useBoolean();

  // state
  const [errorMessage, setErrorMessage] = useState("");

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: dummyLogin.email,
      password: dummyLogin.password,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    setErrorMessage("");

    if (
      data.email !== dummyLogin.email ||
      data.password !== dummyLogin.password
    ) {
      setErrorMessage("Invalid email or password.");
      return;
    }

    try {
      await login(data.email, data.password);
    } catch (error) {
      console.log(error);
      const status = error?.response?.status;
      if (status === 400 || status === 401) {
        setErrorMessage("Invalid email or password.");
        return;
      }

      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleLoginSSO = async () => {
    try {
      await loginSSO("google");
    } catch (error) {
      console.error("SSO Login Error:", error);
      toast.error("SSO login failed. Please try again.");
    }
  };

  return (
    <FormProvider {...methods}>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Login with your Google account</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    className="flex items-center gap-2"
                    onClick={handleLoginSSO}
                  >
                    <Iconify icon="flat-color-icons:google" width={20} />
                    Login with Google
                  </Button>
                </Field>

                <FieldSeparator>Or continue with</FieldSeparator>

                <Field>
                  <RHFTextField
                    name="email"
                    label="Email"
                    placeholder="m@example.com"
                    type="email"
                  />
                </Field>

                <Field>
                  <RHFTextField
                    name="password"
                    label="Password"
                    placeholder="••••••••"
                    type={showPassword.value ? "text" : "password"}
                    propsEndInput={
                      <button
                        type="button"
                        onClick={showPassword.onToggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      >
                        <Iconify
                          icon={
                            showPassword.value
                              ? "mdi:eye-off-outline"
                              : "mdi:eye-outline"
                          }
                          width={18}
                        />
                      </button>
                    }
                  />
                </Field>

                {errorMessage && (
                  <p className="text-red-500 text-sm text-center">
                    {errorMessage}
                  </p>
                )}

                <Field>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>

                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <a href="#" className="underline">
                      Sign up
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline">
            Privacy Policy
          </a>
          .
        </FieldDescription>
      </div>
    </FormProvider>
  );
}
