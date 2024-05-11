import { JSX } from 'react';
import { Button } from 'antd';

export default function Role(): JSX.Element {
  console.log(window.Context);

  const getRoles = () => {
    window.Context.sqlClient.getRoles({}).then((res) => {
      console.log(res);
    });
  };

  const insertRole = () => {
    window.Context.sqlClient.setRole({
      roleKeyword: 'Vampire',
      roleName: '吸血鬼',
      roleColor: 'red',
    });
  };
  const deleteRole = () => {
    window.Context.sqlClient.deleteRole({
      id: 1,
    });
  };

  return (
    <div>
      Role
      <Button onClick={getRoles}>获取数据</Button>
      <Button onClick={insertRole}>新增数据</Button>
      <Button onClick={deleteRole}>删除数据</Button>
    </div>
  );
}
