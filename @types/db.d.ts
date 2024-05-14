declare global {
  namespace DB {
    interface Role {
      id?: number;
      name?: string;
      label?: string;
      checkIcon?: string;
      gem?: string;
      emblem?: string;
      cardBackground?: string;
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

    interface Card {
      id?: number;
      roleId?: number;
      typeId?: number;
      traitId?: number;
      rarityId?: number;
      cost?: number;
      name?: string;
      isToken?: boolean;
      tokenIds?: number[];
      parentId?: number;
      isReborn?: boolean;
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
  }
}

export {};
