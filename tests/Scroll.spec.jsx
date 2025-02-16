import { mount } from 'enzyme';
import { spyElementPrototypes } from '@rc-component/util/lib/test/domHook';
import React from 'react';
import { act } from 'react-dom/test-utils';
import Table from '../src';

describe('Table.Scroll', () => {
  const data = [
    { key: 'key0', name: 'Lucy' },
    { key: 'key1', name: 'Jack' },
  ];
  const createTable = props => {
    const columns = [{ title: 'Name', dataIndex: 'name', key: 'name' }];

    return <Table columns={columns} data={data} {...props} />;
  };

  it('should always has content when scroll.x is enabled', () => {
    const data = [];
    const createTable = props => {
      return <Table data={data} {...props} />;
    };

    const wrapper = mount(createTable({ scroll: { x: true } }));

    expect(wrapper.find('.rc-table-tbody').hostNodes().text()).toContain('No Data');
  });

  it('renders scroll.x is true', () => {
    const wrapper = mount(createTable({ scroll: { x: true } }));
    expect(wrapper.find('table').props().style.width).toEqual('auto');
    expect(wrapper.find('.rc-table-content').props().style.overflowX).toEqual('auto');
    expect(wrapper.find('.rc-table-content').props().style.overflowY).toEqual('hidden');
  });

  it('renders scroll.x is a number', () => {
    const wrapper = mount(createTable({ scroll: { x: 200 } }));
    expect(wrapper.find('table').props().style.width).toEqual(200);
  });

  it('renders scroll.y is a number', () => {
    const wrapper = mount(createTable({ scroll: { y: 200 } }));
    expect(wrapper.find('.rc-table-body').props().style.maxHeight).toEqual(200);
  });

  it('renders scroll.x and scroll.y are both true', () => {
    const wrapper = mount(createTable({ scroll: { x: true, y: 200 } }));
    expect(wrapper.find('.rc-table-body').props().style.overflowX).toEqual('auto');
    expect(wrapper.find('.rc-table-body').props().style.overflowY).toEqual('scroll');
  });

  it('fire scroll event', () => {
    vi.useFakeTimers();
    let scrollLeft = 0;
    let scrollTop = 0;

    const setScrollLeft = vi.fn((_, val) => {
      scrollLeft = val;
    });
    const setScrollTop = vi.fn((_, val) => {
      scrollTop = val;
    });

    const domSpy = spyElementPrototypes(HTMLDivElement, {
      scrollLeft: {
        get: () => scrollLeft,
        set: setScrollLeft,
      },
      scrollTop: {
        get: () => scrollTop,
        set: setScrollTop,
      },
      scrollWidth: {
        get: () => 200,
      },
      clientWidth: {
        get: () => 100,
      },
    });

    const newColumns = [
      { title: 'title1', dataIndex: 'a', key: 'a', width: 100, fixed: 'left' },
      { title: 'title2', dataIndex: 'b', key: 'b' },
      { title: 'title3', dataIndex: 'c', key: 'c' },
      { title: 'title4', dataIndex: 'd', key: 'd', width: 100, fixed: 'right' },
    ];
    const newData = [
      { a: '123', b: 'xxxxxxxx', c: 3, d: 'hehe', key: '1' },
      { a: 'cdd', b: 'edd12221', c: 3, d: 'haha', key: '2' },
    ];
    const wrapper = mount(
      <Table
        columns={newColumns}
        data={newData}
        scroll={{
          x: 200,
          y: 200,
        }}
      />,
    );

    vi.runAllTimers();
    // Use `onScroll` directly since simulate not support `currentTarget`
    act(() => {
      const headerDiv = wrapper.find('div.rc-table-header').instance();

      const wheelEvent = new WheelEvent('wheel');
      Object.defineProperty(wheelEvent, 'deltaX', {
        get: () => 10,
      });

      headerDiv.dispatchEvent(wheelEvent);
      vi.runAllTimers();
    });

    expect(setScrollLeft).toHaveBeenCalledWith(undefined, 10);
    setScrollLeft.mockReset();

    act(() => {
      wrapper
        .find('.rc-table-body')
        .props()
        .onScroll({
          currentTarget: {
            scrollLeft: 33,
            scrollWidth: 200,
            clientWidth: 100,
          },
        });
    });
    vi.runAllTimers();
    expect(setScrollLeft).toHaveBeenCalledWith(undefined, 33);
    setScrollLeft.mockReset();

    domSpy.mockRestore();
    vi.useRealTimers();
  });

  it('trigger inner scrollTo when set `top` 0 after render', () => {
    let isTriggerScroll = false;
    spyElementPrototypes(HTMLElement, {
      scrollTo: _ => {
        isTriggerScroll = true;
      },
    });

    const tRef = React.createRef();

    const wrapper = mount(createTable({ ref: tRef }));

    tRef.current.scrollTo({
      top: 0,
    });
    expect(isTriggerScroll).toEqual(true);
  });
});
