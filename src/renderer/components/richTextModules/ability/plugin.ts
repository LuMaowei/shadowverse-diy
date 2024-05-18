import { DomEditor, IDomEditor } from '@wangeditor/editor';
import { IExtendConfig } from './interface';

function getMentionConfig(editor: IDomEditor) {
  const { EXTEND_CONF } = editor.getConfig();
  const { abilityConfig } = EXTEND_CONF as IExtendConfig;
  return abilityConfig;
}

function withAbility<T extends IDomEditor>(editor: T) {
  const { insertText, isInline, isVoid } = editor;
  const newEditor = editor;

  newEditor.insertText = (t) => {
    const elems = DomEditor.getSelectedElems(newEditor);
    const isSelectedVoidElem = elems.some((elem) => newEditor.isVoid(elem));
    if (isSelectedVoidElem) {
      insertText(t);
      return;
    }

    const mentionConfig = getMentionConfig(newEditor);

    if (!mentionConfig) {
      insertText(t);
    } else {
      const { showModal, hideModal } = getMentionConfig(newEditor) || {};

      if (t === '@') {
        setTimeout(() => {
          if (showModal) showModal(newEditor);

          setTimeout(() => {
            // eslint-disable-next-line no-underscore-dangle
            function _hide() {
              if (hideModal) hideModal(newEditor);
            }

            newEditor.once('fullScreen', _hide);
            newEditor.once('unFullScreen', _hide);
            newEditor.once('scroll', _hide);
            newEditor.once('modalOrPanelShow', _hide);
            newEditor.once('modalOrPanelHide', _hide);

            function hideOnChange() {
              if (newEditor.selection != null) {
                _hide();
                newEditor.off('change', hideOnChange);
              }
            }

            newEditor.on('change', hideOnChange);
          });
        });
      }

      insertText(t);
    }
  };

  // 重写 isInline
  newEditor.isInline = (elem) => {
    const type = DomEditor.getNodeType(elem);
    if (type === 'ability') {
      return true;
    }

    return isInline(elem);
  };

  newEditor.isVoid = (elem) => {
    const type = DomEditor.getNodeType(elem);
    if (type === 'ability') {
      return true;
    }

    return isVoid(elem);
  };

  return newEditor;
}

export default withAbility;
