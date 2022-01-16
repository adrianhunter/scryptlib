
import { assert, expect } from 'chai';
import { newTx, loadDescription } from './helper';
import { buildContractClass, buildTypeClasses } from '../src/contract';



const Test = buildContractClass(loadDescription('LibAsProperty4_desc.json'));
const { L, L1} = buildTypeClasses(Test);

describe('LibAsProperty4 test', () => {
  let instance, result;

  before(() => {
    instance = new Test(1, new L1(1, 1));
  });

  it('should success when call unlock', () => {
    result = instance.unlock(1).verify()
    expect(result.success, result.error).to.be.true
  });

  it('should success when call unlock', () => {
    result = instance.unlock(3).verify()
    expect(result.success, result.error).to.be.false
  });

});