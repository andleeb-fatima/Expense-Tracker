import { useApp } from "./TestContext";
export const FilterBar = () => {
  const { filter, setFilter } = useApp();
  console.log(filter);
  console.log("FilterBar render");
  return (
    <>
      <div>FilterBar</div>
      <button onClick={() => setFilter("all")}>Change Filter</button>
    </>
  );
};

export default FilterBar;
