import { Select, SelectProps } from 'antd';
import { useEffect, useState } from 'react';

const apiMap = {
  trait: {
    api: window.Context.sqlClient.getTraits,
    label: 'name',
    value: 'id',
  },
  ability: {
    api: window.Context.sqlClient.getAbilities,
    label: 'name',
    value: 'id',
  },
  cardPack: {
    api: window.Context.sqlClient.getCardPacks,
    label: 'name',
    value: 'id',
  },
  card: { api: window.Context.sqlClient.getCards, label: 'name', value: 'id' },
};

type DataTable = 'trait' | 'ability' | 'cardPack' | 'card';

type OptionsType = DB.Traits[] | DB.Abilities[] | DB.CardPacks[] | DB.Cards[];

export default function DataTableSelect(
  props: SelectProps & { dataTable: DataTable },
) {
  const { dataTable, ...rest } = props;
  // @ts-ignore
  const [options, setOptions] = useState<OptionsType>([]);
  const currentApi = apiMap[dataTable];

  useEffect(() => {
    currentApi.api({}).then((res: OptionsType) => {
      setOptions(res);
    });
  }, [dataTable]);

  return (
    <Select
      allowClear
      options={options}
      fieldNames={{ label: currentApi.label, value: currentApi.value }}
      {...rest}
    />
  );
}
