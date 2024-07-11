import {useState} from 'react';

export const AccMem = () => {
    const [selectMembership, setSelectMembership] =useState('')
  return (
    <div className="membership">
      <label for="membership1">
        {' '}
        <input
          type="radio"
          onChange={(event) => setSelectMembership(event.target.value)}
          value="mem1"
          name="membership"
          id="membership1"
          className="radio"
          defaultChecked={true}
        />{' '}
        Conference Registration
      </label>
      <label for="membership2">
        {' '}
        <input
          type="radio"
          onChange={(event) => setSelectMembership(event.target.value)}
          value="mem2"
          name="membership"
          id="membership2"
          className="radio"
        />{' '}
        Conference Registration fee + ACC Membership
      </label>
    </div>
  );
};
