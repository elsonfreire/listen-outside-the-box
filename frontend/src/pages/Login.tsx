import Button from "../components/Button";

const LoginPage = () => {
  return (
    <div>
      <h2 className="font-bold text-2xl">Login</h2>

      <form className="flex flex-col gap-4 my-5">
        <div>
          <p>Username</p>
          <input className="bg-neutral-300 rounded-md" />
        </div>

        <div>
          <p>Password</p>
          <input className="bg-neutral-300 rounded-md" />
        </div>

        <Button type="submit">Login</Button>
      </form>
    </div>
  );
};

export default LoginPage;
