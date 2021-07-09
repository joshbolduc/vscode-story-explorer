import { storybookPreviewFocusedContext } from '../constants/constants';
import { setContext } from '../util/setContext';

export const setStorybookPreviewFocused = (active: boolean) => {
  setContext(storybookPreviewFocusedContext, active);
};
