import { Editor } from 'slate';
import { DomEditor, IDomEditor } from '@wangeditor/core';
import { IButtonMenu } from '@wangeditor/editor';

abstract class BaseMenu implements IButtonMenu {
  abstract readonly title: string;

  abstract readonly iconSvg: string;

  readonly tag = 'button';

  protected abstract readonly mark: string;

  exec(editor: IDomEditor) {
    const { mark } = this;
    const active = this.isActive(editor);
    if (active) {
      Editor.removeMark(editor, mark);
    } else {
      Editor.addMark(editor, mark, '#f5c05e');
    }
  }

  getValue(editor: IDomEditor): string | boolean {
    const { mark } = this;
    const curMarks = Editor.marks(editor);
    // @ts-ignore
    if (curMarks && curMarks[mark]) return curMarks[mark];
    return '';
  }

  isActive(editor: IDomEditor): boolean {
    const color = this.getValue(editor);
    return !!color;
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) return true;

    const [match] = Editor.nodes(editor, {
      match: (n) => {
        const type = DomEditor.getNodeType(n);

        if (type === 'pre') return true; // 代码块
        if (Editor.isVoid(editor, n)) return true; // void node

        return false;
      },
      universal: true,
    });

    // 命中，则禁用
    return !!match;
  }
}

export default BaseMenu;
