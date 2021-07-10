import React, { useState } from 'react';

export default {
  title: 'Example/Form',
};

export const Form = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        setSubmitted(true);
        e.preventDefault();
      }}
    >
      <fieldset>
        <legend>Sample form</legend>
        <label>
          Text input: <input type="text" />
        </label>
      </fieldset>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <button type="submit">Submit</button>
        {submitted && <div style={{ color: 'green' }}>Submitted!</div>}
      </div>
    </form>
  );
};
