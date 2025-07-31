declare module '@radix-ui/react-switch' {
  import * as React from 'react';

  type PrimitiveButtonProps = React.ComponentPropsWithoutRef<'button'>;

  interface SwitchProps extends PrimitiveButtonProps {
    checked?: boolean;
    defaultChecked?: boolean;
    required?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string;
    onCheckedChange?(checked: boolean): void;
  }

  const Root: React.ForwardRefExoticComponent<
    SwitchProps & React.RefAttributes<HTMLButtonElement>
  >;

  const Thumb: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>
  >;
} 