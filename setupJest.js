import {jest} from '@jest/globals';
import fetchMock from 'jest-fetch-mock';
jest.setMock('node-fetch', fetchMock);
