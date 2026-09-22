import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
vi.mock('@react-three/fiber',()=>({Canvas:()=> <div aria-label="3D viewport"/>}))
import RoomDesigner from '../pages/RoomDesigner'
const key='nepal-cozy-care-room-v1'
beforeEach(()=>localStorage.clear())
describe('room designer controls',()=>{
 it('adds, edits, undoes and redoes without duplicated history under StrictMode',()=>{
  render(<StrictMode><RoomDesigner/></StrictMode>)
  fireEvent.click(screen.getByRole('button',{name:/Cozy Sofa/}))
  const select=screen.getByLabelText('Select room item') as HTMLSelectElement
  expect(select.options.length).toBe(2)
  fireEvent.change(select,{target:{value:select.options[1].value}})
  fireEvent.change(screen.getByLabelText('Position X'),{target:{value:'99'}})
  expect(Number((screen.getByLabelText('Position X') as HTMLInputElement).value)).toBeLessThan(3)
  fireEvent.click(screen.getByRole('button',{name:'Undo'}))
  fireEvent.change(select,{target:{value:select.options[1].value}})
  expect((screen.getByLabelText('Position X') as HTMLInputElement).value).toBe('0')
  fireEvent.click(screen.getByRole('button',{name:'Undo'}))
  expect(select.options.length).toBe(1)
  fireEvent.click(screen.getByRole('button',{name:'Redo'}))
  expect(select.options.length).toBe(2)
 })
 it('persists a design and restores it after remount',()=>{
  const v=render(<RoomDesigner/>);fireEvent.click(screen.getByRole('button',{name:/Snake Plant/}));fireEvent.click(screen.getByRole('button',{name:'Save'}))
  expect(JSON.parse(localStorage.getItem(key)!).items[0].kind).toBe('snake');v.unmount();render(<RoomDesigner/>);
  expect((screen.getByLabelText('Select room item') as HTMLSelectElement).options.length).toBe(2)
 })
 it('handles invalid saved data',()=>{
  localStorage.setItem(key,JSON.stringify({width:7,depth:6,items:null}));render(<RoomDesigner/>);
  expect(screen.getByRole('status').textContent).toContain('could not be loaded')
 })
 it('keeps furniture within resized rooms and removes selected objects',()=>{
  render(<RoomDesigner/>);fireEvent.click(screen.getByRole('button',{name:/Cozy Sofa/}));const s=screen.getByLabelText('Select room item') as HTMLSelectElement
  fireEvent.change(s,{target:{value:s.options[1].value}});fireEvent.change(screen.getByLabelText('Position X'),{target:{value:'2'}})
  fireEvent.change(screen.getByRole('slider',{name:/Room width/}),{target:{value:'4'}})
  expect(Number((screen.getByLabelText('Position X') as HTMLInputElement).value)).toBeLessThan(.8)
  fireEvent.click(screen.getByRole('button',{name:/Remove/}));expect(s.options.length).toBe(1)
 })
})
