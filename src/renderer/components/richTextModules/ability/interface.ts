import { IDomEditor } from '@wangeditor/editor';

export interface IExtendConfig {
  abilityConfig: {
    showModal: (editor: IDomEditor) => void;
    hideModal: (editor: IDomEditor) => void;
  };
}
