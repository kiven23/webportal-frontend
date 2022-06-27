import Unauthorize from "../components/errors/Unauthorize";

const errorRoutes = [
  { path: "/403", component: Unauthorize, name: "unauthorize" }
];

export default errorRoutes;
