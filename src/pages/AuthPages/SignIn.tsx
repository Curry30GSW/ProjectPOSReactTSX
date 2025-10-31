import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Iniciar Sesión | Sistema POS"
        description="Esta es la página de inicio de sesión del sistema POS"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
