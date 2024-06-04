import { Flex, Form } from 'antd';
import IllustratorInput from './IllustratorInput';

export default function CardFooter() {
  const formInstance = Form.useFormInstance();
  const isToken = Form.useWatch('isToken', formInstance);
  const showIllustrator = Form.useWatch('showIllustrator', formInstance);

  return (
    <Flex className="card-footer" vertical>
      <Flex justify="space-between">
        <div>※卡片能力为开发中内容。</div>
        {showIllustrator ? (
          <Form.Item noStyle name="illustrator">
            <IllustratorInput />
          </Form.Item>
        ) : null}
      </Flex>
      {isToken ? (
        <Flex justify="space-between">
          <div>※这张卡片为特殊卡。</div>
        </Flex>
      ) : null}
    </Flex>
  );
}
