import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Select } from 'antd';
import { IDomEditor } from '@wangeditor/editor';
import { BaseSelectRef } from 'rc-select/lib/BaseSelect';

export interface AbilityInputProps {
  onSelect?: (value: { label: string; value: string | number }) => void;
  editor: IDomEditor | null;
}

export interface AbilityInputRef {
  open: () => void;
  close: () => void;
}

function AbilityInput(
  props: AbilityInputProps,
  ref: React.Ref<AbilityInputRef>,
) {
  const { onSelect, editor } = props;
  const [style, setStyle] = useState({
    display: 'none',
    top: 0,
    left: 0,
  });
  const [selectOpen, setSelectOpen] = useState(false);
  const [options, setOptions] = useState<DB.Abilities[]>([]);

  const holderRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<BaseSelectRef>(null);

  useEffect(() => {
    window.Context.sqlClient.getAbilities({}).then((res: DB.Abilities[]) => {
      setOptions(res);
    });
  }, []);

  useEffect(() => {
    if (selectOpen) {
      selectRef.current?.focus();
    }
  }, [selectOpen]);

  const open = () => {
    const domSelection = document.getSelection();
    const domRange = domSelection?.getRangeAt(0);
    if (domRange == null) return;
    const rect = domRange.getBoundingClientRect();
    // @ts-ignore
    const parent = domRange.commonAncestorContainer.parentElement.offsetParent;
    // @ts-ignore
    const parentRect = parent.getBoundingClientRect();
    let tempLeft = rect.left - parentRect.left;
    if (tempLeft + 240 > parentRect.width) {
      tempLeft = parentRect.width - 120;
    }
    setStyle((v) => ({
      ...v,
      top: rect.top - parentRect.top - 40,
      left: tempLeft,
      display: 'block',
    }));
    setStyle((v) => ({ ...v, display: 'block' }));
    setSelectOpen(true);
  };

  const close = () => {
    setSelectOpen(false);
    setStyle((v) => ({ ...v, display: 'none' }));
    editor?.restoreSelection();
  };

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  return (
    <div className="z-10 absolute" ref={holderRef} style={style}>
      <Select
        ref={selectRef}
        className="w-[240px]"
        allowClear
        autoFocus
        labelInValue
        placement="topLeft"
        open={selectOpen}
        onSelect={onSelect}
        options={options}
        fieldNames={{ label: 'name', value: 'id' }}
        getPopupContainer={() => holderRef.current!}
        onInputKeyDown={(e) => {
          if (e.key === 'Escape') {
            close();
          }
        }}
      />
    </div>
  );
}

export default forwardRef(AbilityInput);
