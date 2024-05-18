declare global {
  namespace DB {
    interface Pagination {
      current?: number;
      pageSize?: number;
      pagination?: boolean;
    }

    // 兵种
    interface Traits {
      id?: number;
      name?: string; // 名称
    }

    // 能力关键字
    interface Abilities {
      id?: number;
      name?: string; // 名称
      sort?: number; // 排序
      description?: string; // 描述
    }

    // 卡包
    interface CardPacks {
      id?: number;
      name?: string; // 名称
      sort?: number; // 排序
      description?: string; // 描述
    }

    // 卡片
    interface Cards {
      id?: number;
      classes?: string; // 职业
      type?: string; // 类型
      rarity?: string; // 稀有度
      cardPackId?: number; // 所属卡包id
      cost?: number; // 消费
      name?: string; // 名称
      isReborn?: number; // 是否为复生卡
      isToken?: number; // 是否为特殊卡
      image?: string; // 图片base64码
      traitIds?: number; // 兵种id列表
      tokenIds?: string; // 特殊卡id列表
      parentIds?: string; // 所属卡片id列表
    }

    // 卡片描述
    interface CardDetails {
      id?: number;
      cardId?: number; // 所属卡片id
      evolvedStage?: number; // 进化状态
      attack?: number; // 攻击
      health?: number; // 生命
      description?: string; // 描述
      abilityIds?: string; // 能力关键字id列表
    }
  }
}

export {};
