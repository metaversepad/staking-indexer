import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Staked, Unstaked } from "../generated/Staking/Staking"
import { User, StakedEntity, UnstakedEntity, TotalStaked } from "../generated/schema"

export function addTotalDepositedByUser(address: Address, newValue: BigInt): void {
  let id = address.toHexString();
  let user = User.load(id);
  if (user == null) {
    user = new User(id);
    user.address = address;
    user.totalValue = BigInt.fromI32(0);
  }
  user.totalValue = user.totalValue.plus(newValue);
  user.save();
}

export function substractTotalDepositedByUser(address: Address, newValue: BigInt): void {
  let id = address.toHexString();
  let user = User.load(id);
  if (user == null) {
    user = new User(id);
    user.address = address;
    user.totalValue = BigInt.fromI32(0);
  }
  user.totalValue = user.totalValue.minus(newValue);
  user.save();
}

export function handleStaked(event: Staked): void {
  let entity = StakedEntity.load(event.transaction.hash.toHex())
  let totalStakedEntity = TotalStaked.load(event.address.toHex())

  if (!entity) {
    entity = new StakedEntity(event.transaction.hash.toHex())
  }

  if (!totalStakedEntity) {
    totalStakedEntity = new TotalStaked(event.address.toHex())
  }

  addTotalDepositedByUser(event.params.from, event.params.amount);

  entity.from = event.params.from
  entity.amount = event.params.amount
  entity.save()

  totalStakedEntity.amount = totalStakedEntity.amount.plus(event.params.amount);
  totalStakedEntity.save()
}

export function handleUnstaked(event: Unstaked): void {
  let entity = UnstakedEntity.load(event.transaction.hash.toHex())
  let totalStakedEntity = TotalStaked.load(event.address.toHex())

  if (!entity) {
    entity = new UnstakedEntity(event.transaction.hash.toHex())
  }

  if (!totalStakedEntity) {
    totalStakedEntity = new TotalStaked(event.address.toHex())
  }
  substractTotalDepositedByUser(event.params.from, event.params.amount);

  entity.from = event.params.from
  entity.amount = event.params.amount

  entity.save()

  totalStakedEntity.amount = totalStakedEntity.amount.minus(event.params.amount);
  totalStakedEntity.save()
}
