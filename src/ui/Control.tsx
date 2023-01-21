import * as React from "react";

export const RequiredIndicator: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ className = "", ...props }) => {
  return (
    <div
      aria-label="필수"
      className={`w-2 h-2 inline-block bg-orange-700 rounded ${className}`}
      {...props}
    />
  );
};

export interface ControlProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  code: string;
  required?: boolean;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}
const Control: React.FC<ControlProps> = ({
  className,
  children,
  label,
  code,
  required,
  ...props
}) => {
  return (
    <div className={`flex flex-row ${className || ""}`} {...props}>
      <label className="basis-6 shrink-0 flex items-center justify-center">
        {required ? <RequiredIndicator /> : <input type="checkbox" />}
      </label>
      <label className="flex flex-col">
        <span className="inline-flex flex-wrap">
          <span className="mr-2">{label}</span>
          <div className="inline-flex items-center h-6">
            <code className="px-1 rounded text-xs leading-3 text-orange-900 bg-orange-100">
              {code}
            </code>
          </div>
        </span>
        <div>
          {children}
        </div>
      </label>
    </div>
  );
};
export default Control;