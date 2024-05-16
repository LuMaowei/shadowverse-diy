import React from 'react';
import { Upload } from 'antd';
import type { UploadFile } from 'antd';
import ImgCrop from 'antd-img-crop';

export default function CardImageUpload(props: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const { value, onChange } = props;

  const beforeUpload = (file: UploadFile) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    // @ts-ignore
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <ImgCrop rotationSlider showReset aspect={290 / 363} showGrid quality={1}>
      <Upload maxCount={1} beforeUpload={beforeUpload}>
        {!value && (
          <div className="relative z-[-1] w-[290px] h-[363px] bg-white flex justify-center items-center">
            选择图片
          </div>
        )}
        {value && (
          <img
            className="relative z-[-1]"
            width={290}
            height={363}
            src={value}
            alt=""
          />
        )}
      </Upload>
    </ImgCrop>
  );
}
