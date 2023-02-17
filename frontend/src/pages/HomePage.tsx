import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <>
      <h1>Futsal manager</h1>
      <button>
        <Link to="/shifts">Agenda un turno</Link>
      </button>
    </>
  );
};

export default HomePage;
