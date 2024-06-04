import { Form } from 'antd';
import { useEffect, useRef, useState } from 'react';
import CardDetailsInputNumber from './CardDetailsInputNumber';
import CardDetailsTextArea from './CardDetailsTextArea';
import originalSize from '../../config/size';

interface CardDescriptionProps {
  scale: number;
  onSizeChange: (scale: number) => void;
}

const attrLabel: { [key: string]: string } = {
  follower: '进化前',
  spell: '法术',
  amulet: '护符',
};

export default function CardDescription(props: CardDescriptionProps) {
  const { scale, onSizeChange } = props;
  const [textareaHeight, setTextareaHeight] = useState<number>(0);
  const holderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const formInstance = Form.useFormInstance();
  const type = Form.useWatch('type', formInstance);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const entryHeight = entry.target.clientHeight;
      const entryTextareaHeight = entry.target.children[1].clientHeight;
      const resultHeight =
        entryHeight > originalSize.descriptionHeight + 27
          ? entryHeight + originalSize.fillHeight
          : entryHeight;
      let resultScale = resultHeight / originalSize.descriptionHeight;
      if (resultScale < 1) {
        resultScale = 1;
      } else if (resultScale > 1.5) {
        resultScale = 1.5;
      }
      onSizeChange(resultScale);
      setTextareaHeight(entryTextareaHeight);
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      if (contentRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        resizeObserver.unobserve(contentRef.current);
      }
    };
  }, []);

  return (
    <div ref={holderRef} className="card-description-container">
      <div ref={contentRef}>
        <div
          className={
            type === 'follower'
              ? 'card-description-follower-attr'
              : 'card-description-attr'
          }
        >
          <span className="absolute bottom-[18px]">{attrLabel[type]}</span>
          {type === 'follower' && (
            <>
              <div className="card-details-attr right-[140px] bottom-[18px]">
                <Form.Item noStyle name="unevolvedAttack" initialValue={0}>
                  <CardDetailsInputNumber />
                </Form.Item>
              </div>
              <div className="card-details-attr right-[40px] bottom-[18px]">
                <Form.Item noStyle name="unevolvedHealth" initialValue={0}>
                  <CardDetailsInputNumber />
                </Form.Item>
              </div>
            </>
          )}
        </div>
        <div className="card-details-follower-unevolved">
          <Form.Item noStyle name="unevolvedDescription">
            <CardDetailsTextArea />
          </Form.Item>
        </div>
        {type === 'follower' && (
          <div
            style={{
              transform: `translateY(${textareaHeight * (1 / scale - 1)}px)`,
            }}
          >
            <div className="card-description-follower-attr">
              <span className="absolute bottom-[18px]">进化后</span>
              <div className="card-details-attr right-[140px] bottom-[18px]">
                <Form.Item noStyle name="evolvedAttack" initialValue={0}>
                  <CardDetailsInputNumber />
                </Form.Item>
              </div>
              <div className="card-details-attr right-[40px] bottom-[18px]">
                <Form.Item noStyle name="evolvedHealth" initialValue={0}>
                  <CardDetailsInputNumber />
                </Form.Item>
              </div>
            </div>
            <div className="card-details-follower-unevolved">
              <Form.Item noStyle name="evolvedDescription">
                <CardDetailsTextArea />
              </Form.Item>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
