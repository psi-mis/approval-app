// import * as Util from 'util';
import * as Util  from 'util'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import '@testing-library/jest-dom'

// console.log(TextEncoder);
// global.TextEncoder = Util.TextEncoder;
// global.TextDecoder = Util.TextDecoder;
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = Util.TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = Util.TextDecoder;
}

configure({ adapter: new Adapter() })
