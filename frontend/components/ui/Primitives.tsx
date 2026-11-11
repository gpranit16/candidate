import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-display text-sm font-semibold tracking-tight transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none border',
  {
    variants: {
      variant: {
        primary:
          'bg-[#C6F36B] text-[#101010] border-[#C6F36B] hover:bg-[#d5f88d] active:translate-x-[1px] active:translate-y-[1px]',
        secondary:
          'bg-[#222222] text-[#F5F5F0] border-[#383838] hover:border-[#F5F5F0] hover:bg-[#2a2a2a]',
        outline:
          'bg-transparent text-[#F5F5F0] border-[#383838] hover:border-[#C6F36B] hover:text-[#C6F36B]',
        ghost:
          'bg-transparent text-[#969696] border-transparent hover:text-[#F5F5F0] hover:bg-[#1B1B1B]',
        danger:
          'bg-[#FF895D] text-[#101010] border-[#FF895D] hover:bg-[#ffa07c]',
      },
      size: {
        sm: 'h-9 px-3.5 text-xs',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-sm',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full h-11 bg-[#151515] border border-[#383838] px-3.5 text-sm text-[#F5F5F0] placeholder:text-[#969696]/70 transition-colors focus:border-[#C6F36B] focus:outline-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full bg-[#151515] border border-[#383838] p-3.5 text-sm text-[#F5F5F0] placeholder:text-[#969696]/70 transition-colors focus:border-[#C6F36B] focus:outline-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'w-full h-11 bg-[#151515] border border-[#383838] px-3 text-sm text-[#F5F5F0] transition-colors focus:border-[#C6F36B] focus:outline-none disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'block font-display text-xs font-medium uppercase tracking-wider text-[#969696] mb-1.5',
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  variant = 'default',
  children,
}: {
  className?: string;
  variant?: 'default' | 'lime' | 'coral' | 'violet';
  children: React.ReactNode;
}) {
  const styles = {
    default: 'border-[#383838] bg-[#222222] text-[#F5F5F0]',
    lime: 'border-[#C6F36B]/50 bg-[#C6F36B]/10 text-[#C6F36B]',
    coral: 'border-[#FF895D]/50 bg-[#FF895D]/10 text-[#FF895D]',
    violet: 'border-[#A78BFA]/50 bg-[#A78BFA]/10 text-[#A78BFA]',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase whitespace-nowrap',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('bg-[#1B1B1B] border border-[#383838]', className)}>
      {children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-[#222222] border border-[#383838]/50', className)} />;
}

