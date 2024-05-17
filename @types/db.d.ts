declare global {
  namespace DB {
    interface Pagination {
      current?: number;
      pageSize?: number;
      pagination?: boolean;
    }

    // 兵种
    interface Trait {
      id?: number;
      name?: string;
    }

    // 能力关键字
    interface Ability {
      id?: number;
      name?: string;
      sort?: number;
      description?: string;
    }

    // 卡包
    interface CardPack {
      id?: number;
      name?: string;
      sort?: number;
      description?: string;
    }

    // 卡片
    interface Card {
      id?: number;
      classes?: string;
      type?: string;
      rarity?: string;
      traitIds?: number;
      cardPackId?: number;
      cost?: number;
      name?: string;
      isToken?: number;
      tokenIds?: string;
      parentId?: number;
      isReborn?: number;
      image?: string;
    }

    // 卡片描述
    interface CardDetails {
      id?: number;
      cardId?: number;
      evolvedStage?: number;
      attack?: number;
      health?: number;
      abilityIds?: string;
      description?: string;
    }

    // 单卡信息
    interface CardSingle extends DB.Card {
      traitKey?: string;
      traitName?: string;
      cardPackKey?: string;
      cardPackName?: string;
      cardPackSort?: number;
      cardPackDescription?: string;
      evolutionStages?: string;
      attacks?: string;
      healths?: string;
      abilityKeys?: string;
      abilityNames?: string;
      cardDetailsDescriptions?: string;
    }
  }
}

export {};
