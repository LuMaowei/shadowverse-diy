declare global {
  namespace DB {
    interface Role {
      id?: number;
      name?: string;
      label?: string;
      avatar?: string;
      gem?: string;
      emblem?: string;
      background?: string;
    }

    interface Type {
      id?: number;
      name?: string;
      label?: string;
    }

    interface Rarity {
      id?: number;
      name?: string;
      label?: string;
    }

    interface Frame {
      id?: number;
      typeId?: number;
      rarityId?: number;
      frame?: string;
    }

    interface Trait {
      id?: number;
      name?: string;
      label?: string;
    }

    interface Ability {
      id?: number;
      name?: string;
      label?: string;
      sort?: number;
      description?: string;
    }

    interface CardPack {
      id?: number;
      name?: string;
      label?: string;
      sort?: number;
      description?: string;
    }

    interface Card {
      id?: number;
      roleId?: number;
      typeId?: number;
      traitId?: number;
      rarityId?: number;
      cardPackId?: number;
      cost?: number;
      name?: string;
      isToken?: number;
      tokenIds?: number[];
      parentId?: number;
      isReborn?: number;
      image?: string;
    }

    interface CardDetails {
      id?: number;
      cardId?: number;
      evolutionStage?: number;
      attack?: number;
      health?: number;
      description?: string;
    }

    interface CardSingle extends DB.Card {
      roleName?: string;
      roleLabel?: string;
      roleAvatar?: string;
      roleGem?: string;
      roleEmblem?: string;
      roleBackground?: string;
      typeName?: string;
      typeLabel?: string;
      traitName?: string;
      traitLabel?: string;
      rarityName?: string;
      rarityLabel?: string;
      cardPackName?: string;
      cardPackLabel?: string;
      cardPackSort?: number;
      cardPackDescription?: string;
      evolutionStages?: string;
      attacks?: string;
      healths?: string;
      cardDetailsDescriptions?: string;
    }
  }
}

export {};
