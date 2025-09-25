function Text() {
  return (
    <div className="box-border content-stretch flex gap-6 items-start justify-start px-0 py-3 relative shrink-0 w-[463px]" data-name="Text">
      <div className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-slate-500">
        <p className="leading-[20px] mb-0">
          <span className="font-['Inter:Medium',_sans-serif] font-medium not-italic text-[#0f0f0f]">collec</span>
          <span className="font-['Inter:Medium_Italic',_sans-serif] font-medium italic text-[#0f0f0f]">tt</span>
          <span className="font-['Inter:Medium',_sans-serif] font-medium not-italic text-[#0f0f0f]">o</span>
          <span className="text-[#0f0f0f]"> </span>
          <span>
            is a simple hoppy (or anything you imagine) tracker:
            <br aria-hidden="true" />
            <br aria-hidden="true" />
          </span>
        </p>
        <ul className="css-ed5n1g list-disc mb-0">
          <li className="mb-0.5 ms-[21px]">
            <span className="leading-[20px]">Create your own or grab template collection (boards)</span>
          </li>
          <li className="mb-0.5 ms-[21px]">
            <span className="leading-[20px]">{`Drag & drop items from status lanes`}</span>
          </li>
          <li className="leading-[20px] mb-0.5 ms-[21px]">
            <span>{`Add `}</span>
            <span>{`optional `}</span>text description<span>{` and links`}</span>
            <span>{` to each item`}</span>
          </li>
          <li className="mb-0.5 ms-[21px]">
            <span className="leading-[20px]">Give optional rate for each completed card</span>
          </li>
          <li className="mb-0.5 ms-[21px]">
            <span className="leading-[20px]">Share collection with the World when you create an account</span>
          </li>
          <li className="mb-0.5 ms-[21px]">
            <span className="leading-[20px]">{`Export & Import collections JSON`}</span>
          </li>
          <li className="ms-[21px]">
            <span className="leading-[20px]">ADHD friendly by minimal design and interaction</span>
          </li>
        </ul>
        <p className="leading-[20px]">
          <br aria-hidden="true" />
          This is an alpha version, so some bugs still here 🪲
        </p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-slate-900 box-border content-stretch flex gap-2.5 items-center justify-center px-4 py-2 relative rounded-[6px] shrink-0" data-name="button">
      <div className="font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
        <p className="leading-[24px] whitespace-pre">Close</p>
      </div>
    </div>
  );
}

function ButtonSection() {
  return (
    <div className="content-stretch flex gap-2 items-center justify-end relative shrink-0 w-[464px]" data-name="button section">
      <Button />
    </div>
  );
}

function NavigationMenuContent() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-[24px] relative rounded-[6px] shrink-0" data-name="navigation menu content">
      <div aria-hidden="true" className="absolute border border-slate-300 border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]" />
      <Text />
      <ButtonSection />
    </div>
  );
}

export default function Help() {
  return (
    <div className="content-stretch flex flex-col gap-2 items-start justify-start relative size-full" data-name="help">
      <NavigationMenuContent />
    </div>
  );
}