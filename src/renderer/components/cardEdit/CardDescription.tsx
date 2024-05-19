import { Form } from 'antd';
import { useEffect, useRef, useState } from 'react';
import pick from 'lodash/pick';
import CardDetailsInputNumber from './CardDetailsInputNumber';
import CardDetailsTextArea from './CardDetailsTextArea';
import { originalSize, ratio } from '../../config/size';

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
  const holderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [holderSize, setHolderSize] = useState<{
    contentHeight: number;
    contentWidth: number;
  }>(pick(originalSize, ['contentWidth', 'contentHeight']));
  const formInstance = Form.useFormInstance();
  const type = Form.useWatch('type', formInstance);

  useEffect(() => {
    const temp = holderSize.contentHeight / originalSize.contentHeight;
    onSizeChange(temp * 0.9 < 1 ? 1 : temp);
  }, [holderSize.contentHeight]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const entryHeight = entry.contentRect.height + originalSize.fillHeight;
      const resultWidth = ratio * entryHeight;
      setHolderSize({
        contentWidth:
          resultWidth < originalSize.contentWidth
            ? originalSize.contentWidth
            : resultWidth,
        contentHeight:
          entryHeight < originalSize.contentHeight
            ? originalSize.contentHeight
            : entryHeight,
      });
    });

    // 开始观察
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    // 清理函数
    return () => {
      if (contentRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        resizeObserver.unobserve(contentRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={holderRef}
      className="card-description-container"
      style={{
        width: holderSize.contentWidth,
        height: holderSize.contentHeight,
      }}
    >
      <div ref={contentRef}>
        <div
          className={
            type === 'follower'
              ? 'card-description-follower-attr'
              : 'card-description-attr'
          }
          style={{ height: scale * originalSize.attrHeight }}
        >
          <span
            className="absolute"
            style={{
              bottom: scale * 18,
              fontSize: scale * originalSize.attrFontSize,
            }}
          >
            {attrLabel[type]}
          </span>
          {type === 'follower' && (
            <>
              <div
                className="card-details-attr"
                style={{
                  right: scale * 140,
                  bottom: scale * 18,
                  fontSize: scale * originalSize.attrFontSize,
                }}
              >
                <Form.Item noStyle name="unevolvedAttack" initialValue={0}>
                  <CardDetailsInputNumber />
                </Form.Item>
              </div>
              <div
                className="card-details-attr"
                style={{
                  right: scale * 40,
                  bottom: scale * 18,
                  fontSize: scale * originalSize.attrFontSize,
                }}
              >
                <Form.Item noStyle name="unevolvedHealth" initialValue={0}>
                  <CardDetailsInputNumber />
                </Form.Item>
              </div>
            </>
          )}
        </div>
        <div
          className="crad-details-follower-unevolved"
          style={{
            width: `calc(100% - ${
              originalSize.detailsUnderlineWidth * scale
            }px)`,
          }}
        >
          <Form.Item noStyle name="unevolvedDescription">
            <CardDetailsTextArea />
          </Form.Item>
        </div>
        {type === 'follower' && (
          <>
            <div
              className="card-description-follower-attr"
              style={{ height: scale * originalSize.attrHeight }}
            >
              <span
                className="absolute"
                style={{
                  bottom: scale * 18,
                  fontSize: scale * originalSize.attrFontSize,
                }}
              >
                进化后
              </span>
              <div
                className="card-details-attr"
                style={{
                  right: scale * 140,
                  bottom: scale * 18,
                  fontSize: scale * originalSize.attrFontSize,
                }}
              >
                <Form.Item noStyle name="evolvedAttack" initialValue={0}>
                  <CardDetailsInputNumber />
                </Form.Item>
              </div>
              <div
                className="card-details-attr"
                style={{
                  right: scale * 40,
                  bottom: scale * 18,
                  fontSize: scale * originalSize.attrFontSize,
                }}
              >
                <Form.Item noStyle name="evolvedHealth" initialValue={0}>
                  <CardDetailsInputNumber />
                </Form.Item>
              </div>
            </div>
            <div
              className="crad-details-follower-unevolved"
              style={{
                width: `calc(100% - ${
                  originalSize.detailsUnderlineWidth * scale
                }px)`,
              }}
            >
              <Form.Item noStyle name="evolvedDescription">
                <CardDetailsTextArea />
              </Form.Item>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
