import { Select, SelectProps } from 'antd';
import { useEffect, useState } from 'react';

const apiMap = {
  role: { api: window.Context.sqlClient.getRoles, label: 'label', value: 'id' },
  type: { api: window.Context.sqlClient.getTypes, label: 'label', value: 'id' },
  rarity: {
    api: window.Context.sqlClient.getRarities,
    label: 'label',
    value: 'id',
  },
  frame: {
    api: window.Context.sqlClient.getFrames,
    label: 'label',
    value: 'id',
  },
  trait: {
    api: window.Context.sqlClient.getTraits,
    label: 'label',
    value: 'id',
  },
  ability: {
    api: window.Context.sqlClient.getAbilities,
    label: 'label',
    value: 'id',
  },
  cardPack: {
    api: window.Context.sqlClient.getCardPacks,
    label: 'label',
    value: 'id',
  },
  card: { api: window.Context.sqlClient.getCards, label: 'name', value: 'id' },
};

type DataTable =
  | 'role'
  | 'type'
  | 'rarity'
  | 'frame'
  | 'trait'
  | 'ability'
  | 'cardPack'
  | 'card';

type OptionsType =
  | DB.Role[]
  | DB.Type[]
  | DB.Rarity[]
  | DB.Frame[]
  | DB.Trait[]
  | DB.Ability[]
  | DB.CardPack[]
  | DB.Card[];

export default function DataTableSelect(
  props: SelectProps & { dataTable: DataTable },
) {
  const { dataTable, ...rest } = props;
  // @ts-ignore
  const [options, setOptions] = useState<OptionsType>([]);
  const currentApi = apiMap[dataTable];

  useEffect(() => {
    currentApi.api({ pagination: false }).then((res: OptionsType) => {
      setOptions(res);
    });
  }, [dataTable]);

  return (
    <Select
      {...rest}
      allowClear
      options={options}
      fieldNames={{ label: currentApi.label, value: currentApi.value }}
    />
  );
}
