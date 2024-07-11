/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { observer, useField, useFieldSchema } from '@formily/react';
import { Input as AntdInput, Button, Space, Spin, theme } from 'antd';
import cls from 'classnames';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalTheme } from '../../../global-theme';
import { useDesignable } from '../../hooks/useDesignable';
import { MarkdownVoidDesigner } from './Markdown.Void.Designer';
import { useStyles } from './style';
import { useParseMarkdown } from './util';
import { TextAreaProps } from 'antd/es/input';
import { useBlockHeight } from '../../hooks/useBlockSize';

export interface MarkdownEditorProps extends Omit<TextAreaProps, 'onSubmit'> {
  defaultValue?: string;
  onSubmit?: (value: string) => void;
  onCancel?: (e: React.MouseEvent) => void;
}

const MarkdownEditor = (props: MarkdownEditorProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(props.defaultValue);
  return (
    <div className={'mb-markdown'} style={{ position: 'relative' }}>
      <AntdInput.TextArea
        autoSize={{ minRows: 3 }}
        {...(props as any)}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <Space style={{ position: 'absolute', bottom: 5, right: 5 }}>
        <Button
          onClick={(e) => {
            props.onCancel?.(e);
          }}
        >
          {t('Cancel')}
        </Button>
        <Button
          type={'primary'}
          onClick={() => {
            props.onSubmit?.(value);
          }}
        >
          {t('Save')}
        </Button>
      </Space>
    </div>
  );
};

const useMarkdownHeight = () => {
  const { token } = theme.useToken();
  const height = useBlockHeight();
  if (!height) {
    return;
  }
  return height - 2 * token.paddingLG;
};

export const MarkdownVoid: any = observer(
  (props: any) => {
    const { isDarkTheme } = useGlobalTheme();
    const { componentCls, hashId } = useStyles({ isDarkTheme });
    const { content, className } = props;
    const field = useField();
    const schema = useFieldSchema();
    const { dn } = useDesignable();
    const { onSave, onCancel } = props;
    const { html, loading } = useParseMarkdown(content);
    const height = useMarkdownHeight();
    if (loading) {
      return <Spin />;
    }
    return field?.editable ? (
      <MarkdownEditor
        {...props}
        className
        defaultValue={content}
        onCancel={() => {
          field.editable = false;
          onCancel?.();
        }}
        onSubmit={async (value) => {
          field.editable = false;
          schema['x-component-props'] ?? (schema['x-component-props'] = {});
          schema['x-component-props']['content'] = value;
          field.componentProps.content = value;
          onSave?.(schema);
          dn.emit('patch', {
            schema: {
              'x-uid': schema['x-uid'],
              'x-component-props': {
                content: value,
              },
            },
          });
        }}
      />
    ) : (
      <div
        className={cls([componentCls, hashId, 'nb-markdown nb-markdown-default nb-markdown-table', className])}
        style={{ ...props.style, height: height || '100%', overflow: 'auto' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  },
  { displayName: 'MarkdownVoid' },
);

MarkdownVoid.Designer = MarkdownVoidDesigner;
