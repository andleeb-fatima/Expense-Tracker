import { useApp } from "./TestContext";

export const NoticeBanner = () => {
  const { notice, setNotice } = useApp();
  console.log("NoticeBanner render", notice);

  return (
    <>
      <div>NoticeBanner</div>
      <button onClick={() => setNotice("all")}>Change Notice</button>;
    </>
  );
};

export default NoticeBanner;
