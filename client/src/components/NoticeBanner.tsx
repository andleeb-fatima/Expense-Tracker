import { useApp } from "./TestContext";
import { useZustandStore } from "./TestZStore";
// import { useSelector, useDispatch } from "react-redux";
import { useAppDispatch, useAppSelector } from "./hooks";
import { setNotice } from "./TestReduxStore";
export const NoticeBanner = () => {
  // const notice = useSelector((state) => state.notice);
  // const dispatch = useDispatch();
  const notice = useAppSelector((state) => state.notice);
  const dispatch = useAppDispatch();
  // const { notice, setNotice } = useApp();
  // const notice = useZustandStore((state) => state.notice);
  // const setNotice = useZustandStore((state) => state.setNotice);
  console.log("NoticeBanner render", notice);

  return (
    <>
      <div>NoticeBanner</div>
      <button onClick={() => dispatch(setNotice("Updated"))}>
        Change Notice
      </button>
      ;
    </>
  );
};

export default NoticeBanner;
