import { imgLogo } from "./svg-ac0h0";

function Text() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-1 items-start justify-start left-[212px] px-3 py-0 top-0"
      data-name="Text"
    >
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-slate-500 w-[227px]">
        <p className="leading-[20px]">
          <span className="font-['Inter:Medium',_sans-serif] font-medium not-italic text-[#0f0f0f]">
            collectto
          </span>
          <span className="font-['Inter:Medium_Italic',_sans-serif] font-medium italic text-[#0f0f0f]">
            tt
          </span>
          <span className="font-['Inter:Medium',_sans-serif] font-medium not-italic text-[#0f0f0f]">
            o
          </span>
          <span>
            {`is a minimalist & fun way to track your hobbies, it’s states and progress, and then share it with the world.`}
            <br aria-hidden="true" />
            <br aria-hidden="true" />
          </span>
          <span className="font-['Inter:Medium',_sans-serif] font-medium not-italic text-[#0f0f0f]">
            collec
          </span>
          <span className="font-['Inter:Medium_Italic',_sans-serif] font-medium italic text-[#0f0f0f]">
            tt
          </span>
          <span className="font-['Inter:Medium',_sans-serif] font-medium not-italic text-[#0f0f0f]">
            o
          </span>
          <span>{` is a pet project of `}</span>
          <a
            className="[text-underline-position:from-font] cursor-pointer decoration-solid underline"
            href="https://kolyakorzh.com"
          >
            <span
              className="[text-underline-position:from-font] decoration-solid leading-[20px]"
              href="https://kolyakorzh.com"
            >
              mykola korzh
            </span>
          </a>
          <span>{` created specifically for `}</span>
          #figmamakeathon
          <span>
            {` in september 2025.`}
            <br aria-hidden="true" />
            <br aria-hidden="true" />
            being a hard-to-focus person, I find it calming to
            track things I’ve been (and plan) doing.
          </span>
        </p>
      </div>
    </div>
  );
}

function GradientBox() {
  return (
    <div
      className="absolute bg-white bottom-[30.37%] from-[#0015ff] left-0 overflow-clip right-0 rounded-[4px] to-[#ffc800] top-0"
      data-name="gradient box"
    >
      <div
        className="absolute h-[56.34px] left-[55.91px] top-[66.66px] w-[76.735px]"
        data-name="logo"
      >
        <img
          className="block max-w-none size-full"
          src={imgLogo}
        />
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-2 items-start justify-start shrink-0" />
  );
}

function Frame7() {
  return (
    <div className="absolute content-stretch flex flex-col gap-5 inset-[44.81%_12.77%_16.67%_12.77%] items-start justify-start">
      <Frame6 />
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-[44.81%_12.77%_16.67%_12.77%]">
      <Frame7 />
    </div>
  );
}

function Poster() {
  return (
    <div
      className="h-[270px] relative shrink-0 w-[188px]"
      data-name="poster"
    >
      <Text />
      <GradientBox />
      <Group5 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="box-border content-stretch flex gap-6 items-start justify-start px-0 py-3 relative shrink-0 w-[463px]">
      <Poster />
    </div>
  );
}

function Button() {
  return (
    <div
      className="bg-slate-900 box-border content-stretch flex gap-2.5 items-center justify-center px-4 py-2 relative rounded-[6px] shrink-0"
      data-name="button"
    >
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
        <p className="leading-[24px] whitespace-pre">
          Collectt
        </p>
      </div>
    </div>
  );
}

function ButtonSection() {
  return (
    <div
      className="content-stretch flex gap-2 items-center justify-end relative shrink-0 w-[464px]"
      data-name="button section"
    >
      <Button />
    </div>
  );
}

function NavigationMenuContent() {
  return (
    <div
      className="bg-white box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-[24px] relative rounded-[6px] shrink-0"
      data-name="navigation menu content"
    >
      <div
        aria-hidden="true"
        className="absolute border border-slate-300 border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
      />
      <Frame8 />
      <ButtonSection />
    </div>
  );
}

export default function About() {
  return (
    <div
      className="content-stretch flex flex-col gap-2 items-start justify-start relative size-full"
      data-name="about"
    >
      <NavigationMenuContent />
    </div>
  );
}