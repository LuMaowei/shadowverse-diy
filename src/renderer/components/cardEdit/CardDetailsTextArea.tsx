import { Editor } from '@wangeditor/editor-for-react';
import { IDomEditor } from '@wangeditor/editor';
import React, { useEffect, useRef } from 'react';
import AbilityInput, { AbilityInputRef } from './AbilityInput';
import { jsonStringify } from '../../utils';

interface CardDetailsTextAreaProps {
  value?: string;
  onChange?: (value: string | null | undefined) => void;
  height?: number;
}

function CardDetailsTextArea(props: CardDetailsTextAreaProps) {
  const { value, onChange, height } = props;
  const editorRef = useRef<IDomEditor | null>(null);
  const abilityInputRef = useRef<AbilityInputRef>(null);

  useEffect(() => {
    return () => {
      editorRef.current?.destroy();
    };
  }, []);

  const showAbilityInput = () => {
    abilityInputRef.current?.open();
  };

  const hideAbilityInput = () => {
    abilityInputRef.current?.close();
  };

  const editorConfig = {
    autoFocus: false,
    EXTEND_CONF: {
      abilityConfig: {
        showModal: showAbilityInput,
        hideModal: hideAbilityInput,
      },
    },
  };

  const handleChange = (editor: IDomEditor) => {
    onChange?.(editor.getHtml());
  };

  const handleCreate = (editor: IDomEditor) => {
    editorRef.current = editor;
  };

  const onAbilitySelect = (selectedAbility: {
    label: string;
    value: string | number;
  }) => {
    hideAbilityInput();
    const abilityElem = {
      type: 'ability',
      info: jsonStringify(selectedAbility),
      children: [{ text: '' }],
    };
    editorRef.current?.restoreSelection();
    editorRef.current?.deleteBackward('character');
    editorRef.current?.insertNode(abilityElem);
    editorRef.current?.move(1);
  };

  return (
    <>
      <Editor
        onCreated={handleCreate}
        onChange={handleChange}
        defaultConfig={editorConfig}
        value={value}
        mode="simple"
        style={{ height }}
      />
      <AbilityInput
        ref={abilityInputRef}
        editor={editorRef.current}
        onSelect={onAbilitySelect}
      />
    </>
  );
}

export default CardDetailsTextArea;
