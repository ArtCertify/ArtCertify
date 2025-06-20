import { Check, X } from 'lucide-react';
import { Children, cloneElement, type ReactElement, useMemo } from 'react';
import { cn } from '../../lib/utils';

export type StepState = 'success' | 'error' | 'active' | 'pending';

export type StepProps = {
  title: string;
  customState?: StepState;
  description?: string;
  number?: number;
  isActive?: boolean;
  isCompleted?: boolean;
  isError?: boolean;
  className?: string;
  direction?: 'vertical' | 'horizontal';
  variant?: 'chip';
  onClick?: () => void;
};

export function Stepper({
  direction = 'vertical',
  activeStep,
  children,
  title,
  titleClassName,
  className,
}: {
  direction?: 'vertical' | 'horizontal';
  activeStep: number;
  children: ReactElement<StepProps>[];
  title?: string;
  titleClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {title && (
        <h3 className={cn('text-xs font-light text-gray-500 uppercase', titleClassName)}>
          {title}
        </h3>
      )}
      <div
        className={cn('flex flex-col gap-5', {
          'flex-col': direction === 'vertical',
          'flex-row': direction === 'horizontal',
        })}
      >
        {Children.map(children, (child, index) => {
                  return cloneElement(child, {
          number: index + 1,
          isCompleted:
            typeof child.props.isCompleted === 'boolean'
              ? child.props.isCompleted
              : index < activeStep - 1,
          isActive:
            typeof child.props.isActive === 'boolean'
              ? child.props.isActive
              : index === activeStep - 1,
          direction,
        });
        })}
      </div>
    </div>
  );
}

export function Step({
  title,
  description,
  number,
  isActive,
  isCompleted,
  isError,
  className,
  direction,
  onClick,
  customState,
}: StepProps) {
  const state = useMemo(() => {
    if (customState) {
      return customState;
    } else if (isCompleted) {
      return 'success';
    } else if (isError) {
      return 'error';
    } else if (isActive) {
      return 'active';
    } else {
      return 'pending';
    }
  }, [customState, isActive, isCompleted, isError]);

  return (
    <div
      className={cn(
        'flex gap-3',
        {
          'min-w-0 flex-1 flex-col items-center': direction === 'horizontal',
          'flex-row': direction === 'vertical',
          'cursor-pointer': !!onClick,
        },
        className
      )}
      onClick={onClick}
    >
      <StatusIcon number={number} state={state} />

      <div
        className={cn('flex flex-1 flex-row items-center gap-2 font-light', {
          'font-semibold': state === 'active',
        })}
      >
        <span
          className={cn('text-slate-300', {
            'whitespace-nowrap': direction === 'vertical',
            'text-center': direction === 'horizontal',
            'text-white': state === 'active',
            'text-green-400': state === 'success',
            'text-red-400': state === 'error',
          })}
        >
          {title}
        </span>

        {description && (
          <span className="text-xs text-slate-500 ml-2">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusIcon({
  number,
  state,
  size = 'md',
}: {
  number?: number;
  state?: StepState;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full border border-slate-600 text-sm text-slate-400',
        {
          'border-green-500 bg-green-500 text-white': state === 'success',
          'border-red-500 bg-red-500 text-white': state === 'error',
          'border-blue-500 bg-blue-500/20 text-blue-400': state === 'active',
        },
        `${size === 'sm' ? 'size-5' : 'size-7'}`
      )}
    >
      {state === 'success' ? (
        <Check className={cn('size-4', { 'size-3': size === 'sm' })} />
      ) : state === 'error' ? (
        <X className={cn('size-4', { 'size-3': size === 'sm' })} />
      ) : typeof number === 'number' ? (
        number
      ) : (
        ''
      )}

      {state === 'active' && (
        <div
          className="absolute top-0 left-0 h-full w-full animate-spin rounded-full border border-solid border-blue-500 border-e-transparent"
        />
      )}
    </div>
  );
} 