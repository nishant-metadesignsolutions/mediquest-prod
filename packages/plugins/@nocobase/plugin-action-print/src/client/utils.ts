/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { useDetailsBlockContext, useFormBlockContext } from '@nocobase/client';
import { useReactToPrint } from 'react-to-print';

export const useDetailPrintActionProps = () => {
  const context = useFormBlockContext();
  const { formBlockRef } = useDetailsBlockContext();
  const printHandler = useReactToPrint({
    content: () => context?.formBlockRef?.current || formBlockRef?.current,
    pageStyle: `@media print {
        * {
          margin: 0;
        }
        :not(.ant-formily-item-control-content-component) > div.ant-formily-layout>div:first-child {
          overflow: hidden; height: 0;
        }
      }`,
  });
  return {
    async onClick() {
      printHandler();
    },
  };
};
