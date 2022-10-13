import styled from 'styled-components'

const ExitButton: React.FC<{ text: string; func: () => void }> = ({
  text,
  func
}) => {
  return <Button onClick={() => func()}>{text}</Button>
}

const Button = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  border: none;
  background: none;
  color: white;
  font-size: x-large;
  text-transform: uppercase;
  font-family: 'Press Start 2P';
`

export default ExitButton
