import { useApp } from "./TestContext";
// import { useZustandStore } from "./TestZStore";
// import { useSelector, useDispatch } from "react-redux";
import { useAppDispatch, useAppSelector } from "./hooks";
import { setFilter } from "./TestReduxStore";
export const FilterBar = () => {
  // const { filter, setFilter } = useApp();
  // const filter = useZustandStore((state) => state.filter);
  // const setFilter = useZustandStore((state) => state.setFilter);
  const filter = useAppSelector((state) => state.filter);
  const dispatch = useAppDispatch();
  console.log("FilterBar render", filter);
  return (
    <>
      <div>FilterBar</div>
      <button onClick={() => dispatch(setFilter("new"))}>Change Filter</button>
    </>
  );
};

export default FilterBar;
