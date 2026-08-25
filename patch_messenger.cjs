const fs = require('fs');
let code = fs.readFileSync('src/components/chat/MessengerView.tsx', 'utf8');

// 1. Unread badge (from bg-[#123D2A] dark:bg-white to Yellow bg-[#F4C430] text-[#123D2A])
code = code.replace(
  /bg-\[#123D2A\] dark:bg-white text-white dark:text-\[#171A17\]/g,
  'bg-[#F4C430] text-[#123D2A]'
);

// 2. isSelected bg
code = code.replace(
  /\? 'bg-gray-50\/50 dark:bg-white\/5'/g,
  "? 'bg-[#CBD9C6]/20 dark:bg-[#1E5C41]/20'"
);

// 3. Own messages
code = code.replace(
  /'bg-\[#171A17\] text-white dark:bg-white dark:text-\[#171A17\]'/g,
  "'bg-[#123D2A] text-[#F5F1E8] dark:bg-[#F4C430] dark:text-[#123D2A]'"
);

// 4. Other messages
code = code.replace(
  /'bg-gray-100 text-\[#171A17\] dark:bg-white\/5 dark:text-gray-300'/g,
  "'bg-[#F5F1E8] text-[#123D2A] dark:bg-white/5 dark:text-gray-300'"
);

// 5. Send button
code = code.replace(
  /text-\[#123D2A\] dark:text-\[#F4C430\] hover:text-\[#171A17\] dark:hover:text-white/g,
  'text-[#F4C430] hover:text-[#E4B528]'
);

fs.writeFileSync('src/components/chat/MessengerView.tsx', code);
console.log('MessengerView updated');
