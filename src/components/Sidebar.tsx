import React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';
import { useSidebar } from '../hooks/useSidebar';
import { useLayout } from '../hooks/useLayout';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Overlay } from './Overlay';

type BreakPoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'always';

const BREAK_POINTS: Record<BreakPoint, string> = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px',
  always: 'always',
};

export interface SidebarProps extends React.HTMLAttributes<HTMLHtmlElement> {
  /**
   * width of the sidebar
   * @default ```250px```
   */
  width?: string;

  /**
   * width of the sidebar when collapsed
   * @default ```80px```
   */
  collapsedWidth?: string;

  /**
   * initial collapsed status
   * @default ```false```
   */
  defaultCollapsed?: boolean;

  /**
   * when set to ```true``` the sidebar will have its own scrollbar
   * @default ```false```
   */
  fixed?: boolean;

  /**
   * set when the sidebar should trigger responsiveness behavior
   *
   */
  breakPoint?: BreakPoint;

  /**
   * alternative breakpoint value that will be used to trigger responsiveness
   *
   */
  customBreakPoint?: string;

  /**
   * sidebar background color
   */
  backgroundColor?: string;

  /**
   * duration for the transition in milliseconds to be used in collapse and toggle behavior
   * @default ```300```
   */
  transitionDuration?: number;

  /**
   * sidebar background image
   */
  image?: string;

  /**
   * set overlay color
   * @default ```rgb(0, 0, 0, 0.3)```
   */
  overlayColor?: string;

  rtl?: boolean;
}

interface StyledSidebarProps extends Omit<SidebarProps, 'backgroundColor'> {
  collapsed?: boolean;
  toggled?: boolean;
  broken?: boolean;
  rtl?: boolean;
}

type StyledInnerSidebarProps = Pick<SidebarProps, 'backgroundColor'>;

const StyledSidebar = styled.aside<StyledSidebarProps>`
  color: #b3b8d4;
  position: relative;
  width: ${({ width, collapsed, collapsedWidth }) => (collapsed ? collapsedWidth : width)};
  min-width: ${({ width, collapsed, collapsedWidth }) => (collapsed ? collapsedWidth : width)};
  transition: ${({ transitionDuration }) => `width, left, right, ${transitionDuration}ms`};

  ${({ rtl }) => (rtl ? 'direction: rtl' : '')};

  ${({ fixed }) =>
    fixed
      ? ` height: 100%;
        overflow: auto;
        ~ .layout {
          height: 100%;
          overflow: auto;
        }`
      : ''}

  ${({ broken, collapsed, collapsedWidth, toggled, width, rtl }) =>
    broken
      ? ` 
        position: fixed;
        height: 100%;
        top: 0px;
        z-index: 100;
        ${
          rtl
            ? `
            right: -${width};
            ${collapsed ? `right:-${collapsedWidth};` : ''}
            ${toggled ? 'right:0;' : ''}
            `
            : `
            left: -${width};
            ${collapsed ? `left:-${collapsedWidth};` : ''}
            ${toggled ? 'left:0;' : ''}`
        }

      
        `
      : ''}
`;

const StyledInnerSidebar = styled.div<StyledInnerSidebarProps>`
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 3;
  ${({ backgroundColor }) => (backgroundColor ? `background-color:${backgroundColor};` : '')}
`;

const StyledSidebarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
`;

export const Sidebar: React.FC<SidebarProps> = ({
  width = '250px',
  collapsedWidth = '80px',
  fixed = false,
  defaultCollapsed = false,
  className,
  children,
  breakPoint,
  customBreakPoint,
  backgroundColor,
  transitionDuration = 300,
  overlayColor = 'rgb(0, 0, 0, 0.3)',
  image,
  rtl,
  ...rest
}) => {
  const broken = useMediaQuery(
    customBreakPoint ?? (breakPoint ? BREAK_POINTS[breakPoint] : breakPoint),
  );

  const {
    updateSidebarState,
    collapsed: collapsedSidebar,
    fixed: fixedSidebar,
    width: sidebarWidth,
    collapsedWidth: sidebarCollapsedWidth,
    broken: brokenSidebar,
    toggled: toggledSidebar,
    transitionDuration: SidebarTransitionDuration,
    rtl: sidebarRtl,
  } = useSidebar();

  const { rtl: layoutRtl } = useLayout();

  const handleOverlayClick = () => {
    updateSidebarState({ toggled: false });
  };

  React.useEffect(() => {
    updateSidebarState({ fixed, width, collapsedWidth, broken, rtl });
  }, [fixed, width, collapsedWidth, broken, updateSidebarState, rtl]);

  React.useEffect(() => {
    updateSidebarState({
      collapsed: defaultCollapsed,
      transitionDuration,
      toggled: false,
    });
  }, [defaultCollapsed, transitionDuration, updateSidebarState]);

  return (
    <StyledSidebar
      data-testid="sidebar-test-id"
      fixed={fixedSidebar}
      collapsed={collapsedSidebar}
      broken={brokenSidebar}
      toggled={toggledSidebar}
      rtl={sidebarRtl ?? layoutRtl}
      width={sidebarWidth}
      collapsedWidth={sidebarCollapsedWidth}
      transitionDuration={SidebarTransitionDuration ?? 300}
      className={classnames(
        'sidebar',
        { collapsed: collapsedSidebar, toggled: toggledSidebar, broken: brokenSidebar },
        className,
      )}
      {...rest}
    >
      <StyledInnerSidebar
        data-testid="inner-sidebar-test-id"
        className="sidebar-inner"
        backgroundColor={backgroundColor}
      >
        {children}
      </StyledInnerSidebar>
      {image ? (
        <StyledSidebarImage
          data-testid="sidebar-img-test-id"
          src={image}
          alt="sidebar background"
          className="sidebar-bg"
        />
      ) : null}
      {brokenSidebar && toggledSidebar ? (
        <Overlay onOverlayClick={handleOverlayClick} overlayColor={overlayColor} />
      ) : null}
    </StyledSidebar>
  );
};
