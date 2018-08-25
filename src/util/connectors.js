import { Connect, SimpleSigner } from 'uport-connect';
import Key from './key.json';

const uport = new Connect('Battleship-dApp', {
  clientId: '2om2bQq7KxJWhsYHQ7v8FyQdQyWprqEYrzo',
  network: 'rinkeby',
  signer: SimpleSigner(Key.uPortSigner),
});
  
const web3 = uport.getWeb3();
export { web3, uport };
